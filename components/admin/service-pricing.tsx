"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createServicePrice, deleteServicePrice, getServicePricing, updateServicePrice } from "@/lib/actions/billing"
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react"
import { useEffect, useState } from "react"

export default function ServicePricing() {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [formData, setFormData] = useState({
    service_name: "",
    service_category: "consultation",
    price: "",
    description: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setIsLoading(true)
    const { data } = await getServicePricing()
    setServices(data || [])
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const serviceData = {
      service_name: formData.service_name,
      service_category: formData.service_category,
      price: Number.parseFloat(formData.price),
      description: formData.description,
    }

    if (editingService) {
      const { error } = await updateServicePrice(editingService.id, serviceData)
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" })
        return
      }
      toast({ title: "Success", description: "Service updated successfully" })
    } else {
      const { error } = await createServicePrice(serviceData)
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" })
        return
      }
      toast({ title: "Success", description: "Service added successfully" })
    }

    setIsDialogOpen(false)
    setEditingService(null)
    setFormData({ service_name: "", service_category: "consultation", price: "", description: "" })
    loadServices()
  }

  const handleEdit = (service: any) => {
    setEditingService(service)
    setFormData({
      service_name: service.service_name,
      service_category: service.service_category,
      price: service.price.toString(),
      description: service.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    const { error } = await deleteServicePrice(id)
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" })
      return
    }

    toast({ title: "Success", description: "Service deleted successfully" })
    loadServices()
  }

  const groupedServices = services.reduce(
    (acc, service) => {
      const category = service.service_category || "other"
      if (!acc[category]) acc[category] = []
      acc[category].push(service)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <div className="space-y-6">
      <Card>
        <div className="border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Service Pricing</h2>
            <p className="text-sm text-muted-foreground">Manage clinic service prices for billing</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => {
                  setEditingService(null)
                  setFormData({ service_name: "", service_category: "consultation", price: "", description: "" })
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                <DialogDescription>
                  {editingService ? "Update service details and pricing" : "Add a new service to the pricing list"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input
                    value={formData.service_name}
                    onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                    placeholder="e.g., General Consultation"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.service_category}
                    onValueChange={(value) => setFormData({ ...formData, service_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="test">Test</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="500.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the service"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">
                    {editingService ? "Update" : "Add"} Service
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No services added yet. Click "Add Service" to get started.
            </div>
          ) : (
            <div className="space-y-6">
                  {Object.entries(groupedServices).map(([category, categoryServices]) => {
                    const typedServices = categoryServices as any[];
                    return (
                    <div key={category}>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
                        {category.replace("_", " ")}
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {typedServices.map((service) => (
                          <Card key={service.id} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium">{service.service_name}</p>
                                <p className="text-2xl font-bold text-primary mt-1">
                                  ₹{Number.parseFloat(service.price).toFixed(2)}
                                </p>
                                {service.description && (
                                  <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
                                )}
                              </div>
                              <Badge variant="outline" className="ml-2">
                                {service.service_category}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                                <PencilIcon className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-action-delete hover:bg-action-delete/10 bg-transparent"
                                onClick={() => handleDelete(service.id)}
                              >
                                <TrashIcon className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )})}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
