"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Pencil, Plus, Trash2 } from "lucide-react"

type TemplateType = "reminder" | "receipt" | "other"

type Template = {
  id: string
  name: string
  type: TemplateType
  content: string
}

const seed: Template[] = [
  {
    id: "t-1",
    name: "Appointment Reminder (SMS)",
    type: "reminder",
    content: "Hi {first_name}, this is a reminder for your appointment on {date} at {time}.",
  },
  {
    id: "t-2",
    name: "Receipt (Basic)",
    type: "receipt",
    content: "Receipt for {patient_name}\nAmount: {amount}\nDate: {date}\nThank you.",
  },
]

export default function SmartTemplates() {
  const [templates, setTemplates] = useState<Template[]>(seed)
  const [filter, setFilter] = useState("")
  const [editing, setEditing] = useState<Template | null>(null)
  const [openCreate, setOpenCreate] = useState(false)

  const list = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return q ? templates.filter((t) => t.name.toLowerCase().includes(q) || t.type.includes(q)) : templates
  }, [filter, templates])

  const startCreate = () => {
    setEditing({ id: "", name: "", type: "reminder", content: "" })
    setOpenCreate(true)
  }

  const save = () => {
    if (!editing) return
    if (editing.id) {
      setTemplates((prev) => prev.map((t) => (t.id === editing.id ? editing : t)))
    } else {
      setTemplates((prev) => [{ ...editing, id: `t-${Date.now()}` }, ...prev])
    }
    setEditing(null)
    setOpenCreate(false)
  }

  const remove = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="w-full max-w-xs">
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search templates..." />
        </div>
        <Button onClick={startCreate} className="gap-2 bg-action-add text-action-add-foreground hover:bg-action-add/90">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((t) => (
          <Card key={t.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-pretty">{t.name}</CardTitle>
              <Badge variant="secondary" className="capitalize">
                {t.type}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{t.content}</pre>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent border-action-edit text-action-edit hover:bg-action-edit hover:text-action-edit-foreground"
                  onClick={() => {
                    setEditing(t)
                    setOpenCreate(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="gap-2 bg-action-delete text-action-delete-foreground hover:bg-action-delete/90"
                  onClick={() => remove(t.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={openCreate} onOpenChange={(o) => (!o ? (setOpenCreate(false), setEditing(null)) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="t-name">Name</Label>
              <Input
                id="t-name"
                value={editing?.name ?? ""}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <div className="flex items-center gap-2">
                {(["reminder", "receipt", "other"] as TemplateType[]).map((tt) => (
                  <Button
                    key={tt}
                    type="button"
                    variant={editing?.type === tt ? "default" : "outline"}
                    onClick={() => setEditing((prev) => (prev ? { ...prev, type: tt } : prev))}
                    className="capitalize"
                  >
                    {tt}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-content">Content</Label>
              <Textarea
                id="t-content"
                rows={6}
                value={editing?.content ?? ""}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, content: e.target.value } : prev))}
                placeholder="Use placeholders like {first_name}, {date}, {time}, {amount}..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={save} className="bg-action-save text-action-save-foreground hover:bg-action-save/90">
              {editing?.id ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
