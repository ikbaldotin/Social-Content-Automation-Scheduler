import {
  cancelScheduledPost,
  createPost,
  deletePost,
  getAllPosts,
  updatePost,
  type CreatePostInput,
  type Post,
  type UpdatePostInput,
} from "../api/post.api";
import { create } from "zustand";
interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;

  fetchPosts: (slug: string) => Promise<void>;

  createPost: (slug: string, data: CreatePostInput) => Promise<void>;

  updatePost: (
    slug: string,
    postId: string,
    data: UpdatePostInput,
  ) => Promise<void>;

  deletePost: (slug: string, postId: string) => Promise<void>;

  cancelScheduledPost: (slug: string, postId: string) => Promise<void>;
}

const usePostState = create<PostState>((set) => ({
  posts: [],
  isLoading: false,
  error: null,
  fetchPosts: async (slug) => {
    set({ isLoading: true, error: null, posts: [] });
    try {
      const posts = await getAllPosts(slug);
      set({ posts });
    } catch (error) {
      set({
        error: "Failed to fetch posts",
        posts: [],
      });
      throw new Error("Failed to fetch posts");
    } finally {
      set({ isLoading: false });
    }
  },
  createPost: async (slug, data) => {
    await createPost(slug, data);
    const posts = await getAllPosts(slug);
    set({ posts });
  },
  updatePost: async (slug, postId, data) => {
    await updatePost(slug, postId, data);
    const posts = await getAllPosts(slug);
    set({ posts });
  },
  deletePost: async (slug, postId) => {
    await deletePost(slug, postId);
    const posts = await getAllPosts(slug);
    set({ posts });
  },
  cancelScheduledPost: async (slug, postId) => {
    await cancelScheduledPost(slug, postId);
    const posts = await getAllPosts(slug);
    set({ posts });
  },
}));

export default usePostState;
