import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/blog";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) return { robots: { index: false, follow: false } };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://byteform.io";

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `${siteUrl}/blog/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/8 text-accent border border-accent/15">
      {tag}
    </span>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://byteform.io";
  const formatted = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    publisher: {
      "@type": "Organization",
      name: "ByteForm",
      url: siteUrl,
    },
    url: `${siteUrl}/blog/${slug}`,
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-fg/8 bg-bg/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="ByteForm" className="h-7 w-7" />
            <span className="font-serif text-[17px] tracking-tight text-fg">
              Byte<span className="text-accent">Form</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/blog" className="hidden sm:block text-fg-dim hover:text-fg transition-colors">
              Blog
            </Link>
            <Link href="/demo" className="hidden sm:block text-fg-dim hover:text-fg transition-colors">
              Demo
            </Link>
            <Link
              href="/auth/login"
              className="hidden sm:block text-fg-dim hover:text-fg transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/login?mode=signup"
              className="px-4 py-1.5 rounded-full bg-accent text-[#F7F3EC] text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-fg-dim hover:text-fg transition-colors mb-10"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
          >
            <path
              d="M9 2L4 7l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All posts
        </Link>

        {/* Post meta */}
        <div className="flex items-center gap-3 text-sm text-fg-dim mb-4">
          <time dateTime={post.date}>{formatted}</time>
          <span aria-hidden>·</span>
          <span>{post.readTime} min read</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl text-fg leading-tight mb-5">
          {post.title}
        </h1>

        <p className="text-lg text-fg-dim leading-relaxed mb-6">
          {post.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-fg/8">
          {post.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        {/* MDX content */}
        <article className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:text-fg prose-p:text-fg-dim prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-fg prose-code:text-accent prose-code:bg-accent/8 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-fg/5 prose-pre:border prose-pre:border-fg/10 prose-blockquote:border-l-accent prose-blockquote:text-fg-dim prose-li:text-fg-dim prose-hr:border-fg/10 prose-table:text-sm prose-th:text-fg prose-td:text-fg-dim">
          <MDXRemote source={post.content} />
        </article>

        {/* CTA */}
        <div className="mt-16 pt-12 border-t border-fg/8 text-center">
          <p className="font-serif text-2xl text-fg mb-3">
            Ready to try it yourself?
          </p>
          <p className="text-fg-dim mb-6">
            Build your first conversational form in under 2 minutes — free.
          </p>
          <Link
            href="/auth/login?mode=signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-[#F7F3EC] font-medium hover:bg-accent-hover transition-colors"
          >
            Start for free
          </Link>
        </div>
      </main>
    </div>
  );
}
