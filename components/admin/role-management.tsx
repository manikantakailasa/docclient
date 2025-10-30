"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"

type Role = { id: string; name: string; description?: string }
type Branch = { id: string; name: string; location?: string }
type User = {
  id: string
  name: string
  email: string
  phone?: string
  roleId: string
  branchId: string
  status: "active" | "inactive"
}

const initialRoles: Role[] = [
  { id: "front_desk", name: "Front Desk", description: "Scheduling, reminders, intake" },
  { id: "doctor", name: "Doctor", description: "Clinical charting and prescriptions" },
  { id: "admin", name: "Admin", description: "Organization settings and permissions" },
]

const sampleBranches: Branch[] = [
  { id: "main", name: "Main Clinic", location: "Downtown" },
  { id: "north", name: "North Branch", location: "North District" },
  { id: "south", name: "South Branch", location: "South District" },
]

export default function RoleManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPhone, setNewUserPhone] = useState("")
  const [newUserRole, setNewUserRole] = useState(initialRoles[0]?.id || "")
  const [newUserBranch, setNewUserBranch] = useState(sampleBranches[0]?.id || "")
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Roles CRUD
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDesc, setNewRoleDesc] = useState("")
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const roleNames = useMemo(() => roles.map((r) => r.name.toLowerCase()), [roles])

  function addUser() {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserRole || !newUserBranch) return
    setUsers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        phone: newUserPhone.trim(),
        roleId: newUserRole,
        branchId: newUserBranch,
        status: "active",
      },
    ])
    setNewUserName("")
    setNewUserEmail("")
    setNewUserPhone("")
    setNewUserRole(initialRoles[0]?.id || "")
    setNewUserBranch(sampleBranches[0]?.id || "")
  }

  function updateUser(updated: User) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    setEditingUser(null)
  }

  function deleteUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  function toggleUserStatus(id: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u)),
    )
  }

  function addRole() {
    if (!newRoleName.trim() || roleNames.includes(newRoleName.trim().toLowerCase())) return
    setRoles((prev) => [
      ...prev,
      { id: newRoleName.toLowerCase().replace(/\s+/g, "_"), name: newRoleName.trim(), description: newRoleDesc.trim() },
    ])
    setNewRoleName("")
    setNewRoleDesc("")
  }

  function updateRole(updated: Role) {
    setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    setEditingRole(null)
  }

  function deleteRole(id: string) {
    setRoles((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Users</h2>
            <p className="text-sm text-muted-foreground">Manage user accounts, roles, and branch assignments</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-action-add text-action-add-foreground hover:bg-action-add/90">
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <label className="text-sm">Full Name</label>
                <Input
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g., Dr. Priya Menon"
                />
                <label className="text-sm mt-2">Email</label>
                <Input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                />
                <label className="text-sm mt-2">Phone (optional)</label>
                <Input
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+1 555 0123"
                />
                <label className="text-sm mt-2">Assign Role</label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <label className="text-sm mt-2">Assign Branch</label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={newUserBranch}
                  onChange={(e) => setNewUserBranch(e.target.value)}
                >
                  {sampleBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.location ? `· ${b.location}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button
                  onClick={addUser}
                  className="bg-action-save text-action-save-foreground hover:bg-action-save/90"
                >
                  Save User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4 divide-y">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No users yet. Click "Add User" to get started.</p>
          ) : (
            users.map((user) => {
              const role = roles.find((r) => r.id === user.roleId)
              const branch = sampleBranches.find((b) => b.id === user.branchId)
              return (
                <div key={user.id} className="flex items-center justify-between py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.email} {user.phone ? `· ${user.phone}` : ""}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{role?.name || "—"}</Badge>
                      <span>·</span>
                      <Badge variant="outline">{branch?.name || "—"}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleUserStatus(user.id)}>
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                    <Dialog open={editingUser?.id === user.id} onOpenChange={(o) => !o && setEditingUser(null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                          className="border-action-edit text-action-edit hover:bg-action-edit hover:text-action-edit-foreground"
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-3 py-2">
                          <label className="text-sm">Full Name</label>
                          <Input
                            value={editingUser?.name || ""}
                            onChange={(e) =>
                              setEditingUser((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                            }
                          />
                          <label className="text-sm mt-2">Email</label>
                          <Input
                            type="email"
                            value={editingUser?.email || ""}
                            onChange={(e) =>
                              setEditingUser((prev) => (prev ? { ...prev, email: e.target.value } : prev))
                            }
                          />
                          <label className="text-sm mt-2">Phone</label>
                          <Input
                            value={editingUser?.phone || ""}
                            onChange={(e) =>
                              setEditingUser((prev) => (prev ? { ...prev, phone: e.target.value } : prev))
                            }
                          />
                          <label className="text-sm mt-2">Role</label>
                          <select
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            value={editingUser?.roleId || ""}
                            onChange={(e) =>
                              setEditingUser((prev) => (prev ? { ...prev, roleId: e.target.value } : prev))
                            }
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <label className="text-sm mt-2">Branch</label>
                          <select
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            value={editingUser?.branchId || ""}
                            onChange={(e) =>
                              setEditingUser((prev) => (prev ? { ...prev, branchId: e.target.value } : prev))
                            }
                          >
                            {sampleBranches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => editingUser && updateUser(editingUser)}
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
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Roles</h2>
            <p className="text-sm text-muted-foreground">Define roles and permissions for your organization</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-action-add text-action-add-foreground hover:bg-action-add/90">
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Role</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <label className="text-sm">Role Name</label>
                <Input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Billing"
                />
                <label className="text-sm mt-2">Description</label>
                <Input value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} placeholder="Optional" />
              </div>
              <DialogFooter>
                <Button
                  onClick={addRole}
                  className="bg-action-save text-action-save-foreground hover:bg-action-save/90"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4 divide-y">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{role.name}</p>
                {role.description ? <p className="text-sm text-muted-foreground">{role.description}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={editingRole?.id === role.id} onOpenChange={(o) => !o && setEditingRole(null)}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingRole(role)}
                      className="border-action-edit text-action-edit hover:bg-action-edit hover:text-action-edit-foreground"
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Role</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                      <label className="text-sm">Role Name</label>
                      <Input
                        value={editingRole?.name || ""}
                        onChange={(e) => setEditingRole((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                      />
                      <label className="text-sm mt-2">Description</label>
                      <Input
                        value={editingRole?.description || ""}
                        onChange={(e) =>
                          setEditingRole((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => editingRole && updateRole(editingRole)}
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
                  onClick={() => deleteRole(role.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Note: Role permissions and user access will be enforced in the backend with RBAC and RLS.
      </p>
    </div>
  )
}
