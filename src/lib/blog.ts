import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content/blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readTime: number;
}

export interface Post extends PostMeta {
  content: string;
}

function computeReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function parsePost(filename: string): Post {
  const slug = filename.replace(/\.mdx?$/, "");
  const filePath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? "Untitled",
    description: data.description ?? "",
    date: data.date ?? new Date().toISOString().slice(0, 10),
    tags: Array.isArray(data.tags) ? data.tags : [],
    readTime: computeReadTime(content),
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((filename) => {
      const post = parsePost(filename);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content: _, ...meta } = post;
      return meta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  const mdx = path.join(POSTS_DIR, `${slug}.mdx`);
  const md = path.join(POSTS_DIR, `${slug}.md`);
  const filePath = fs.existsSync(mdx) ? mdx : fs.existsSync(md) ? md : null;

  if (!filePath) return null;

  return parsePost(path.basename(filePath));
}
