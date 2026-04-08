"use client";

import { useState } from "react";
import { useBranches, useDeleteBranch, Branch } from "@/hooks/useBranches";
import BranchForm from "@/components/branches/BranchForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Loader2, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BranchesPage() {
  const { data: branches, isLoading, isError } = useBranches();
  const deleteMutation = useDeleteBranch();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const handleCreateNew = () => {
    setSelectedBranch(null);
    setIsFormOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this branch? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 lg:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
            <Store className="mr-2 text-[#F0A500]" />
            Branches
          </h1>
          <p className="text-gray-500 text-sm">Manage store locations across the network.</p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="bg-[#1B2A4A] hover:bg-slate-800 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-48 text-red-500">
              Failed to load branches. Please try again.
            </div>
          ) : branches?.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-500">
              <Store className="w-12 h-12 text-gray-200 mb-2" />
              <p>No branches found.</p>
              <Button variant="link" onClick={handleCreateNew} className="text-[#1B2A4A]">
                Create your first branch
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Branch Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Location</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches?.map((branch) => (
                    <TableRow key={branch.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-[#1A1A2E]">{branch.name}</TableCell>
                      <TableCell className="text-gray-600">{branch.location || "—"}</TableCell>
                      <TableCell>
                        {branch.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(branch)}
                            className="h-8 shadow-sm"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(branch.id)}
                            className="h-8 shadow-sm bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BranchForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        branchToEdit={selectedBranch}
      />
    </div>
  );
}
