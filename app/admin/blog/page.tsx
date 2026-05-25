import Link from "next/link";
import { ExternalLink, BookOpen } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getPublishedBlogPosts(50);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#131F3C]">บทความ</h1>
          <p className="text-sm text-gray-500 mt-0.5">จัดการบทความผ่าน Notion Blog Database</p>
        </div>
        <a
          href={`https://www.notion.so/${process.env.NOTION_BLOG_DB_ID?.replace(/-/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#131F3C] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1a2a50] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          เปิด Notion Database
        </a>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>วิธีจัดการบทความ:</strong> เพิ่ม แก้ไข หรือลบบทความได้โดยตรงใน Notion Blog Database
        เมื่อ toggle &ldquo;Is Published&rdquo; → ยิง Notion Automation → เว็บ update อัตโนมัติใน ~5 วินาที
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">ชื่อบทความ</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-28">หมวดหมู่</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-32">วันที่เผยแพร่</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-24">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-300 shrink-0" />
                    <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm font-medium text-[#131F3C] hover:underline line-clamp-1">
                      {post.title}
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 ml-6 line-clamp-1">{post.excerpt}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">{post.category}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {post.isPublished ? "เผยแพร่" : "ฉบับร่าง"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <BookOpen className="w-10 h-10" />
            <p className="text-sm">ยังไม่มีบทความ</p>
          </div>
        )}
      </div>
    </div>
  );
}
