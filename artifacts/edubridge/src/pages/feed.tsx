import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useListFeedPosts, getListFeedPostsQueryKey,
  useCreateFeedPost, useLikeFeedPost,
  useListComments, getListCommentsQueryKey,
  useCreateComment,
  useGetTrendingCourses, getGetTrendingCoursesQueryKey,
} from "@workspace/api-client-react";
import { Heart, MessageCircle, Bookmark, TrendingUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["question", "tip", "announcement", "discussion", "resource"] as const;

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    question: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    tip: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    announcement: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    discussion: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    resource: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[cat] ?? ""}`}>{cat}</span>;
}

function CommentSection({ postId }: { postId: number }) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const comments = useListComments(postId, { query: { queryKey: getListCommentsQueryKey(postId) } });
  const createComment = useCreateComment();
  const qc = useQueryClient();

  return (
    <div className="mt-3 space-y-2">
      {comments.data?.map((c) => (
        <div key={c.id} className="flex gap-2 items-start">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {c.authorName?.[0] ?? "?"}
          </div>
          <div className="bg-muted/40 rounded-xl px-3 py-2 flex-1">
            <p className="text-xs font-medium">{c.authorName}</p>
            <p className="text-sm">{c.body}</p>
          </div>
        </div>
      ))}
      {user && (
        <div className="flex gap-2 mt-2">
          <Input
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={lang === "ar" ? "اكتب تعليقاً..." : "Write a comment..."}
            className="flex-1 h-8 text-sm"
            data-testid="input-comment"
          />
          <Button
            size="sm"
            className="h-8"
            disabled={!body.trim() || createComment.isPending}
            onClick={() => {
              createComment.mutate({ postId, data: { body, authorId: user.id } }, {
                onSuccess: () => {
                  qc.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
                  setBody("");
                }
              });
            }}
            data-testid="button-submit-comment"
          >
            {lang === "ar" ? "إرسال" : "Post"}
          </Button>
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const like = useLikeFeedPost();
  const qc = useQueryClient();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
          {post.authorName?.[0] ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{post.authorName}</span>
            <CategoryBadge cat={post.category} />
            <span className="text-muted-foreground text-xs ml-auto">{new Date(post.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</span>
          </div>
          {post.title && <p className="font-semibold mt-1">{post.title}</p>}
          <p className="text-sm text-muted-foreground mt-1">{post.body}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
        <button
          className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
          onClick={() => user && like.mutate({ postId: post.id }, {
            onSuccess: () => qc.invalidateQueries({ queryKey: getListFeedPostsQueryKey() })
          })}
          data-testid={`button-like-${post.id}`}
        >
          <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} />
          {post.likes}
        </button>
        <button
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setShowComments(v => !v)}
          data-testid={`button-comments-${post.id}`}
        >
          <MessageCircle className="w-4 h-4" />
          {post.commentCount}
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <CommentSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Feed() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [category, setCategory] = useState<string>("");
  const [postBody, setPostBody] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState<string>("discussion");
  const [showCreate, setShowCreate] = useState(false);
  const qc = useQueryClient();

  const posts = useListFeedPosts({ category: category || undefined }, { query: { queryKey: getListFeedPostsQueryKey({ category: category || undefined }) } });
  const trending = useGetTrendingCourses({ query: { queryKey: getGetTrendingCoursesQueryKey() } });
  const createPost = useCreateFeedPost();

  return (
    <Shell>
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-6">
          {/* Main Feed */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Create Post */}
            {user && (
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <button
                    className="w-full text-start px-4 py-3 rounded-xl bg-muted/40 text-muted-foreground text-sm hover:bg-muted/60 transition-colors"
                    onClick={() => setShowCreate(v => !v)}
                    data-testid="button-create-post"
                  >
                    {t("postPlaceholder")}
                  </button>
                  <AnimatePresence>
                    {showCreate && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-3">
                        <Input
                          placeholder={lang === "ar" ? "عنوان المنشور (اختياري)" : "Post title (optional)"}
                          value={postTitle}
                          onChange={e => setPostTitle(e.target.value)}
                          data-testid="input-post-title"
                        />
                        <Textarea
                          placeholder={t("postPlaceholder")}
                          value={postBody}
                          onChange={e => setPostBody(e.target.value)}
                          className="min-h-20"
                          data-testid="input-post-body"
                        />
                        <div className="flex gap-2 items-center">
                          <Select value={postCategory} onValueChange={setPostCategory}>
                            <SelectTrigger className="w-40" data-testid="select-post-category">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            className="ml-auto"
                            disabled={!postBody.trim() || createPost.isPending}
                            onClick={() => {
                              createPost.mutate({ data: { body: postBody, title: postTitle || undefined, authorId: user.id, category: postCategory as any } }, {
                                onSuccess: () => {
                                  qc.invalidateQueries({ queryKey: getListFeedPostsQueryKey() });
                                  setPostBody(""); setPostTitle(""); setShowCreate(false);
                                }
                              });
                            }}
                            data-testid="button-submit-post"
                          >
                            {t("createPost")}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategory("")}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!category ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                data-testid="filter-all"
              >
                {lang === "ar" ? "الكل" : "All"}
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${category === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  data-testid={`filter-${c}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Posts */}
            {posts.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted/30 rounded-2xl animate-pulse" />)}
              </div>
            ) : !posts.data?.posts?.length ? (
              <div className="text-center py-16">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{lang === "ar" ? "لا توجد منشورات بعد" : "No posts yet"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.data.posts.map((post: any) => <PostCard key={post.id} post={post} />)}
              </div>
            )}
          </div>

          {/* Sidebar: Trending */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-4">
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">{lang === "ar" ? "الدورات الرائجة" : "Trending Courses"}</span>
                </div>
                {trending.data?.slice(0, 4).map((c: any) => (
                  <a key={c.id} href={`/courses/${c.id}`} className="flex gap-3 py-2 border-b border-border/30 last:border-0 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {c.subject?.[0] ?? "E"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.enrollmentCount} {lang === "ar" ? "طالب" : "students"}</p>
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
