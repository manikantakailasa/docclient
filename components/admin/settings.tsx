"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SmartTemplates from "@/components/admin/smart-templates"
import RoleManagement from "@/components/admin/role-management"
import Branding from "@/components/admin/branding"

export default function Settings() {
  return (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList className="mb-4 rounded-lg bg-muted p-1">
        <TabsTrigger value="templates" className="rounded-md">
          Smart Templates
        </TabsTrigger>
        <TabsTrigger value="users" className="rounded-md">
          User Management
        </TabsTrigger>
        <TabsTrigger value="branding" className="rounded-md">
          Branding
        </TabsTrigger>
      </TabsList>

      <TabsContent value="templates">
        <SmartTemplates />
      </TabsContent>

      <TabsContent value="users">
        <RoleManagement />
      </TabsContent>

      <TabsContent value="branding">
        <Branding />
      </TabsContent>
    </Tabs>
  )
}
