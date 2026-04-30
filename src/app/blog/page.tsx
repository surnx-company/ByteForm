import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on form design, conversion optimisation, and building products people love.",
};

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/8 text-accent border border-accent/15">
      {tag}
    </span>
  );
}

function PostCard({
  slug,
  title,
  description,
  date,
  tags,
  readTime,
}: {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readTime: number;
}) {
  const formatted = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block p-8 rounded-2xl border border-fg/10 bg-bg hover:border-accent/30 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center gap-3 text-sm text-fg-dim mb-4">
        <time dateTime={date}>{formatted}</time>
        <span aria-hidden>·</span>
        <span>{readTime} min read</span>
      </div>

      <h2 className="font-serif text-2xl text-fg leading-snug group-hover:text-accent transition-colors mb-3">
        {title}
      </h2>

      <p className="text-fg-dim leading-relaxed mb-5">{description}</p>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagPill key={tag} tag={tag} />
        ))}
      </div>
    </Link>
  );
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-fg/8 bg-bg/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-serif text-xl text-fg"
          >
            <span>Byte</span>
            <span className="text-accent">Form</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/blog" className="text-accent font-medium">
              Blog
            </Link>
            <Link href="/demo" className="text-fg-dim hover:text-fg transition-colors">
              Demo
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-1.5 rounded-full bg-accent text-ivory text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        <h1 className="font-serif text-5xl text-fg mb-4">Blog</h1>
        <p className="text-lg text-fg-dim max-w-xl">
          Insights on form design, conversion optimisation, and building
          products people actually want to use.
        </p>
      </section>

      {/* Post list */}
      <main className="max-w-5xl mx-auto px-6 pb-24">
        {posts.length === 0 ? (
          <p className="text-fg-dim text-center py-16">No posts yet — check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} {...post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
