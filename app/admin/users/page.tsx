"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Pencil, Trash2, Ban, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ── Types ──────────────────────────────────────────────────────────────────────

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  banned: boolean | null;
  createdAt: string | null;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLES = ["admin", "landlord"] as const;
type Role = (typeof ROLES)[number];

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  admin:    { label: "Admin",    cls: "bg-red-50 text-red-700"    },
  landlord: { label: "Landlord", cls: "bg-blue-50 text-blue-700"  },
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; password: string; role: Role }>({
    name: "",
    email: "",
    password: "",
    role: "landlord",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || (u.name ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", email: "", password: "", role: "landlord" });
    setFormOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingId(u.id);
    setForm({ name: u.name ?? "", email: u.email, password: "", role: (u.role as Role) ?? "landlord" });
    setFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, name: form.name, role: form.role }),
        });
        if (!res.ok) { toast.error("Update failed."); return; }
        toast.success("User updated.");
      } else {
        if (!form.email || !form.password) { toast.error("Email and password are required."); return; }
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) { toast.error("Create user failed."); return; }
        toast.success("User created.");
      }
      setFormOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBan = async (u: User) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, banned: !u.banned }),
    });
    setUsers((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, banned: !x.banned } : x))
    );
    toast.success(!u.banned ? "User suspended." : "User reinstated.");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/users?id=${deleteId}`, { method: "DELETE" });
    toast.success("User deleted.");
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#131F3C] rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#131F3C]">Users</h1>
            <p className="text-sm text-gray-400">{users.length} registered</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#131F3C] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1f2d52] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131F3C]/10 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-center px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const roleBadge = ROLE_BADGE[u.role ?? ""] ?? {
                  label: u.role ?? "—",
                  cls: "bg-gray-50 text-gray-600",
                };
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#131F3C] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {(u.name ?? u.email)[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-[#131F3C]">{u.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge.cls}`}>
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={!u.banned}
                          onCheckedChange={() => handleToggleBan(u)}
                          className="scale-75"
                        />
                        <span className={`text-xs font-medium ${u.banned ? "text-red-500" : "text-emerald-600"}`}>
                          {u.banned ? "Suspended" : "Active"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleBan(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.banned ? "hover:bg-emerald-50 text-emerald-500" : "hover:bg-orange-50 text-orange-400"
                          }`}
                          title={u.banned ? "Reinstate user" : "Suspend user"}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(u.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-sm text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-[#131F3C]">
                {editingId ? "Edit User" : "Add User"}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#131F3C] mb-1.5">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#131F3C]/10"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#131F3C] mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  disabled={!!editingId}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#131F3C]/10 disabled:opacity-50"
                  placeholder="user@example.com"
                />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-[#131F3C] mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#131F3C]/10"
                    placeholder="Minimum 8 characters"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#131F3C] mb-1.5">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#131F3C]/10"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="capitalize">
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  <strong>Admin</strong> — full access.{" "}
                  <strong>Landlord</strong> — can submit and manage their own properties.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
              <button
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#131F3C] text-white text-sm font-medium hover:bg-[#1f2d52] disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All sessions for this user will be terminated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
