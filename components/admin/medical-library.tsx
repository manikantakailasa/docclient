"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Download, Pencil, Plus, Star, Trash2, TrendingUp, Upload } from "lucide-react"
import { useState } from "react"

type Medicine = {
  id?: string
  name?: string
  category?: string
  dosageForms?: string[]
  commonStrengths?: string[]
  commonFrequencies?: string[]
  instructions?: string
  specialties?: string[]
  usageCount?: number
  isFavorite?: boolean
}

type Test = {
  id: string
  name: string
  category: string
  instructions: string
  specialties: string[]
  usageCount: number
  isFavorite: boolean
}

export default function MedicalLibrary() {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: "m1",
      name: "Amoxicillin",
      category: "Antibiotic",
      dosageForms: ["Capsule", "Suspension"],
      commonStrengths: ["250mg", "500mg"],
      commonFrequencies: ["TID", "BID"],
      instructions: "Take with food",
      specialties: ["General", "Pediatrics"],
      usageCount: 145,
      isFavorite: true,
    },
    {
      id: "m2",
      name: "Atorvastatin",
      category: "Statin",
      dosageForms: ["Tablet"],
      commonStrengths: ["10mg", "20mg", "40mg"],
      commonFrequencies: ["OD"],
      instructions: "Take at bedtime",
      specialties: ["Cardiology", "General"],
      usageCount: 98,
      isFavorite: true,
    },
    {
      id: "m3",
      name: "Metformin",
      category: "Antidiabetic",
      dosageForms: ["Tablet", "Extended Release"],
      commonStrengths: ["500mg", "850mg", "1000mg"],
      commonFrequencies: ["BID", "TID"],
      instructions: "Take with meals",
      specialties: ["Endocrinology", "General"],
      usageCount: 87,
      isFavorite: false,
    },
  ])

  const [tests, setTests] = useState<Test[]>([
    {
      id: "t1",
      name: "2D Echo",
      category: "Cardiac Imaging",
      instructions: "Fasting not required",
      specialties: ["Cardiology"],
      usageCount: 56,
      isFavorite: true,
    },
    {
      id: "t2",
      name: "ECG",
      category: "Cardiac Test",
      instructions: "Remove metal objects",
      specialties: ["Cardiology", "General"],
      usageCount: 203,
      isFavorite: true,
    },
    {
      id: "t3",
      name: "HbA1c",
      category: "Blood Test",
      instructions: "Fasting not required",
      specialties: ["Endocrinology", "General"],
      usageCount: 112,
      isFavorite: false,
    },
  ])

  const [medicineSearch, setMedicineSearch] = useState("")
  const [testSearch, setTestSearch] = useState("")
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [medicineDialogOpen, setMedicineDialogOpen] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)

  const filteredMedicines = medicines.filter((m) => (m.name ?? "").toLowerCase().includes(medicineSearch.toLowerCase()))
  const filteredTests = tests.filter((t) => t.name.toLowerCase().includes(testSearch.toLowerCase()))

  const toggleFavoriteMedicine = (id: string) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m)))
  }

  const toggleFavoriteTest = (id: string) => {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t)))
  }

  const deleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id))
  }

  const deleteTest = (id: string) => {
    setTests((prev) => prev.filter((t) => t.id !== id))
  }

  const openMedicineDialog = (medicine?: Medicine) => {
    setEditingMedicine(medicine || null)
    setMedicineDialogOpen(true)
  }

  const openTestDialog = (test?: Test) => {
    setEditingTest(test || null)
    setTestDialogOpen(true)
  }

const saveMedicine = async () => {
	if (!editingMedicine?.name) {
		console.error("Medicine name is required")
		return
	}

	try {
		const res = await fetch("/api/medicines", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(editingMedicine),
		})

		if (!res.ok) throw new Error("Failed to save medicine")

		const saved = await res.json()

		// Update UI state immediately
		setMedicines((prev) => {
			const exists = prev.some((m) => m.id === saved.id)
			if (exists) {
				return prev.map((m) => (m.id === saved.id ? saved : m))
			}
			return [...prev, saved]
		})

		setEditingMedicine(null)
		setMedicineDialogOpen(false)
	} catch (err) {
		console.error("Error saving medicine:", err)
	}
}

  const saveTest = () => {
    console.log("[v0] Save test:", editingTest)
    setTestDialogOpen(false)
    setEditingTest(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Medicines Library</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage frequently prescribed medicines with autocomplete support
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Dialog open={medicineDialogOpen} onOpenChange={setMedicineDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => openMedicineDialog()}
                    className="bg-action-add text-action-add-foreground hover:bg-action-add/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medicine
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingMedicine?.id ? "Edit Medicine" : "Add New Medicine"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Medicine Name</label>
                        <Input placeholder="e.g., Amoxicillin"
                          onChange={(e) => setEditingMedicine({ ...editingMedicine, name: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Input placeholder="e.g., Antibiotic"
                           onChange={(e) => setEditingMedicine({ ...editingMedicine, category: e.target.value })} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Dosage Forms (comma-separated)</label>
                      <Input placeholder="e.g., Capsule, Suspension"
                       onChange={(e) =>
                          setEditingMedicine((prev) => ({
                            ...(prev ?? { id: crypto.randomUUID(), name: "" }),
                            dosageForms: e.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean), // removes empty entries
                          }))
                        }  className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Common Strengths (comma-separated)</label>
                      <Input placeholder="e.g., 250mg, 500mg"
                       onChange={(e) =>
                          setEditingMedicine((prev) => ({
                            ...(prev ?? { id: crypto.randomUUID(), name: "" }),
                            commonStrengths: e.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean), // removes empty entries
                          }))
                        }  className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Common Frequencies (comma-separated)</label>
                      <Input placeholder="e.g., TID, BID, OD"
                       onChange={(e) =>
                          setEditingMedicine((prev) => ({
                            ...(prev ?? { id: crypto.randomUUID(), name: "" }),
                            commonFrequencies: e.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean), // removes empty entries
                          }))
                        }  className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Instructions</label>
                      <Textarea placeholder="e.g., Take with food"
                       onChange={(e) => setEditingMedicine({ ...editingMedicine, instructions: e.target.value })}  className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Specialties (comma-separated)</label>
                      <Input placeholder="e.g., Cardiology, General"
                       onChange={(e) =>
                          setEditingMedicine((prev) => ({
                            ...(prev ?? { id: crypto.randomUUID(), name: "" }),
                            specialties: e.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean), // removes empty entries
                          }))
                        }  className="mt-1" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => setMedicineDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={saveMedicine}
                        className="bg-action-save text-action-save-foreground hover:bg-action-save/90"
                      >
                        Save Medicine
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search medicines..."
              value={medicineSearch}
              onChange={(e) => setMedicineSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Forms</TableHead>
                  <TableHead>Strengths</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavoriteMedicine(med.id ?? "")}
                        aria-label="Toggle favorite"
                      >
                        <Star className={`h-4 w-4 ${med.isFavorite ? "fill-alert text-alert" : ""}`} />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{med.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{(med.dosageForms ?? []).join(", ")}</TableCell>
                    <TableCell className="text-sm">{(med.commonStrengths ?? []).join(", ")}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(med.specialties ?? []).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-sm">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        {med.usageCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openMedicineDialog(med)}
                          className="text-action-edit hover:bg-action-edit/10 hover:text-action-edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMedicine(med.id ?? "")}
                          className="text-action-delete hover:bg-action-delete/10 hover:text-action-delete"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tests & Procedures Library</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage frequently ordered tests and procedures</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => openTestDialog()}
                    className="bg-action-add text-action-add-foreground hover:bg-action-add/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Test
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingTest?.id ? "Edit Test" : "Add New Test"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Test/Procedure Name</label>
                        <Input placeholder="e.g., 2D Echo" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Input placeholder="e.g., Cardiac Imaging" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Instructions</label>
                      <Textarea placeholder="e.g., Fasting not required" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Specialties (comma-separated)</label>
                      <Input placeholder="e.g., Cardiology, General" className="mt-1" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={saveTest}
                        className="bg-action-save text-action-save-foreground hover:bg-action-save/90"
                      >
                        Save Test
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Search tests..." value={testSearch} onChange={(e) => setTestSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Instructions</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavoriteTest(test.id)}
                        aria-label="Toggle favorite"
                      >
                        <Star className={`h-4 w-4 ${test.isFavorite ? "fill-alert text-alert" : ""}`} />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{test.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{test.instructions}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {test.specialties.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-sm">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        {test.usageCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openTestDialog(test)}
                          className="text-action-edit hover:bg-action-edit/10 hover:text-action-edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTest(test.id)}
                          className="text-action-delete hover:bg-action-delete/10 hover:text-action-delete"
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
        </CardContent>
      </Card>
    </div>
  )
}
