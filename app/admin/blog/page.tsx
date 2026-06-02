"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Filter, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
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
import BlogForm from "@/components/admin/BlogForm";
import type { AdminBlogPost as BlogPost } from "@/lib/notion-types";

const CATEGORY_LABEL: Record<string, string> = {
  news:       "News",
  tips:       "Tips & Guides",
  lifestyle:  "Lifestyle",
  investment: "Investment",
  legal:      "Legal & Visas",
  market:     "Market Update",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchPosts = () => {
    setLoading(true);
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const togglePublish = async (post: BlogPost, value: boolean) => {
    setBusyId(post.id);
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, isPublished: value } : p))
    );
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, publish: value }),
      });
      if (!res.ok) throw new Error();
      toast.success(value ? "Post published." : "Post set to draft.");
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, isPublished: !value } : p))
      );
      toast.error("Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const id = deleting.id;
    setDeleting(null);
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted.");
    } catch {
      toast.error("Delete failed.");
    }
  };

  const resetPage = () => setPage(1);

  const filtered = posts.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q);
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchPub =
      publishedFilter === "all" ||
      (publishedFilter === "published" ? p.isPublished : !p.isPublished);
    return matchSearch && matchCat && matchPub;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Unique categories from loaded posts
  const categories = Array.from(new Set(posts.map((p) => p.category))).sort();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#131F3C]">Blog</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage realty blog posts for DoubleN tenants and investors
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setFormOpen(true); }}
          className="flex items-center gap-2 bg-[#131F3C] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1a2a50] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#131F3C]/20 w-56"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#131F3C]/20"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c] ?? c}</option>
          ))}
        </select>
        <select
          value={publishedFilter}
          onChange={(e) => { setPublishedFilter(e.target.value); resetPage(); }}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#131F3C]/20"
        >
          <option value="all">Published &amp; Drafts</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        {(search || categoryFilter !== "all" || publishedFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setCategoryFilter("all"); setPublishedFilter("all"); resetPage(); }}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <Filter className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} posts</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <BookOpen className="w-10 h-10" />
            <p className="text-sm">No posts found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-36">
                  Category
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-32">
                  Published
                </th>
                <th className="text-center text-xs font-semibold text-gray-500 px-3 py-3 uppercase tracking-wider w-24">
                  Live
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-300 shrink-0" />
                      <Link
                        href={`/en/blog/${post.slug}`}
                        target="_blank"
                        className="text-sm font-medium text-[#131F3C] hover:underline line-clamp-1"
                      >
                        {post.title}
                      </Link>
                    </div>
                    {post.excerpt && (
                      <p className="text-xs text-gray-400 mt-0.5 ml-6 line-clamp-1">
                        {post.excerpt}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {CATEGORY_LABEL[post.category] ?? post.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-3 py-4 text-center">
                    <Switch
                      checked={post.isPublished}
                      disabled={busyId === post.id}
                      onCheckedChange={(v) => togglePublish(post, v)}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditingId(post.id); setFormOpen(true); }}
                        className="p-2 text-gray-500 hover:text-[#131F3C] hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(post)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-5 pb-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      <BlogForm
        open={formOpen}
        onOpenChange={setFormOpen}
        postId={editingId}
        onSaved={fetchPosts}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.title}&rdquo; will be moved to Notion trash. This action cannot be undone from the admin panel.
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
