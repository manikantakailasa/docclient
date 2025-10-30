"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"

type Branch = { id: string; name: string; location?: string; contact?: string }

const initialBranches: Branch[] = [
  { id: "main", name: "Main Clinic", location: "Downtown", contact: "+1 555 0100" },
  { id: "north", name: "North Branch", location: "North District", contact: "+1 555 0200" },
  { id: "south", name: "South Branch", location: "South District", contact: "+1 555 0300" },
]

export default function Branding() {
  const [brandName, setBrandName] = useState("ClinHat")
  const [primary, setPrimary] = useState("#0D9488") // teal
  const [accent, setAccent] = useState("#F59E0B") // amber
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [branches, setBranches] = useState<Branch[]>(initialBranches)
  const [newBranchName, setNewBranchName] = useState("")
  const [newBranchLocation, setNewBranchLocation] = useState("")
  const [newBranchContact, setNewBranchContact] = useState("")
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function addBranch() {
    if (!newBranchName.trim()) return
    setBranches((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newBranchName.trim(),
        location: newBranchLocation.trim(),
        contact: newBranchContact.trim(),
      },
    ])
    setNewBranchName("")
    setNewBranchLocation("")
    setNewBranchContact("")
  }

  function updateBranch(updated: Branch) {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setEditingBranch(null)
  }

  function deleteBranch(id: string) {
    setBranches((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="font-semibold text-lg">White Label Settings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm">Brand Name</label>
            <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Your brand" />
          </div>
          <div>
            <label className="text-sm">Logo</label>
            <Input type="file" accept="image/*" onChange={handleLogo} />
          </div>
          <div>
            <label className="text-sm">Primary Color</label>
            <Input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Accent Color</label>
            <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">Preview</p>
          <div className="mt-2 flex items-center gap-3 rounded-md border p-3">
            <div className="h-10 w-10 rounded bg-muted overflow-hidden">
              {logoPreview ? (
                <img
                  src={logoPreview || "/placeholder.svg"}
                  alt="Logo preview"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <span className="font-semibold" style={{ color: primary }}>
              {brandName}
            </span>
            <span className="ml-auto h-5 w-16 rounded" style={{ backgroundColor: accent }} />
          </div>
        </div>

        <div className="mt-4">
          <Button className="bg-action-save text-action-save-foreground hover:bg-action-save/90">Save Branding</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Branches</h2>
            <p className="text-sm text-muted-foreground">Manage clinic locations and branches</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-action-add text-action-add-foreground hover:bg-action-add/90">
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Branch</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <label className="text-sm">Branch Name</label>
                <Input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g., East Branch"
                />
                <label className="text-sm mt-2">Location</label>
                <Input
                  value={newBranchLocation}
                  onChange={(e) => setNewBranchLocation(e.target.value)}
                  placeholder="e.g., East District"
                />
                <label className="text-sm mt-2">Contact</label>
                <Input
                  value={newBranchContact}
                  onChange={(e) => setNewBranchContact(e.target.value)}
                  placeholder="+1 555 0400"
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={addBranch}
                  className="bg-action-save text-action-save-foreground hover:bg-action-save/90"
                >
                  Save Branch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4 divide-y">
          {branches.map((branch) => (
            <div key={branch.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{branch.name}</p>
                <p className="text-sm text-muted-foreground">
                  {branch.location} {branch.contact ? `· ${branch.contact}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={editingBranch?.id === branch.id} onOpenChange={(o) => !o && setEditingBranch(null)}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingBranch(branch)}
                      className="border-action-edit text-action-edit hover:bg-action-edit hover:text-action-edit-foreground"
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Branch</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                      <label className="text-sm">Branch Name</label>
                      <Input
                        value={editingBranch?.name || ""}
                        onChange={(e) => setEditingBranch((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                      />
                      <label className="text-sm mt-2">Location</label>
                      <Input
                        value={editingBranch?.location || ""}
                        onChange={(e) =>
                          setEditingBranch((prev) => (prev ? { ...prev, location: e.target.value } : prev))
                        }
                      />
                      <label className="text-sm mt-2">Contact</label>
                      <Input
                        value={editingBranch?.contact || ""}
                        onChange={(e) =>
                          setEditingBranch((prev) => (prev ? { ...prev, contact: e.target.value } : prev))
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => editingBranch && updateBranch(editingBranch)}
                        className="bg-action-save text-action-save-foreground hover:bg-action-save/90"
                      >
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  className="bg-action-delete text-action-delete-foreground hover:bg-action-delete/90"
                  onClick={() => deleteBranch(branch.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Note: Saving branding can update design tokens and assets globally for this organization.
      </p>
    </div>
  )
}
