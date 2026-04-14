"use client";

import { useState } from "react";
import { useBranches, useDeleteBranch, Branch } from "@/hooks/useBranches";
import BranchForm from "@/components/branches/BranchForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Store } from "lucide-react";
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
    <div className="space-y-6 lg:p-4 pb-24">
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
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-20 ml-auto" />
                </div>
              ))}
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
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                            <Button variant="outline" size="sm" onClick={() => handleEdit(branch)} className="h-8 shadow-sm">
                              <Edit className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(branch.id)} className="h-8 shadow-sm bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100" disabled={deleteMutation.isPending}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="block md:hidden space-y-3 p-4">
                {branches?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No branches yet. Add your first branch above.
                  </div>
                ) : (
                  branches?.map((branch) => (
                    <div key={branch.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-[#1B2A4A] text-base">{branch.name}</h3>
                          <p className="text-gray-500 text-sm mt-0.5">{branch.location || "—"}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${branch.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {branch.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(branch)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-[#1B2A4A] text-[#1B2A4A] text-sm font-medium"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(branch.id)}
                          disabled={deleteMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
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

      <BranchForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        branchToEdit={selectedBranch}
      />
    </div>
  );
}
