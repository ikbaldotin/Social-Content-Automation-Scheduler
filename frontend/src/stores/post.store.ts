import { create } from "zustand";

import {
  cancelScheduledPost,
  createPost as createPostApi,
  deletePost,
  getAllPosts,
  schedulePost as schedulePostApi,
  reschedulePost as reschedulePostApi,
  updatePost,
  type CreatePostInput,
  type Post,
  type UpdatePostInput,
} from "../api/post.api";
interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;

  fetchPosts: (slug: string) => Promise<void>;

  createPost: (slug: string, data: CreatePostInput) => Promise<Post>;

  updatePost: (
    slug: string,
    postId: string,
    data: UpdatePostInput,
  ) => Promise<void>;

  deletePost: (slug: string, postId: string) => Promise<void>;
  schedulePost: (
    slug: string,
    postId: string,
    scheduledAt: string,
  ) => Promise<void>;
  reschedulePost: (
    slug: string,
    postId: string,
    scheduledAt: string,
  ) => Promise<void>;
  cancelScheduledPost: (slug: string, postId: string) => Promise<void>;
}

const usePostStore = create<PostState>((set) => ({
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
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createPost: async (slug, data) => {
    try {
      const post = await createPostApi(slug, data);

      const posts = await getAllPosts(slug);
      set({ posts });

      return post;
    } catch (error) {
      set({
        error: "Failed to create post",
      });
      throw error;
    }
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
  schedulePost: async (slug, postId, scheduledAt) => {
    try {
      await schedulePostApi(slug, postId, scheduledAt);
      const posts = await getAllPosts(slug);
      set({ posts });
    } catch (error) {
      set({
        error: "Failed to schedule post",
      });
      throw error;
    }
  },
  reschedulePost: async (slug, postId, scheduledAt) => {
    try {
      await reschedulePostApi(slug, postId, scheduledAt);

      const posts = await getAllPosts(slug);
      set({ posts });
    } catch (error) {
      set({ error: "Failed to reschedule post" });
      throw error;
    }
  },
  cancelScheduledPost: async (slug, postId) => {
    await cancelScheduledPost(slug, postId);

    const posts = await getAllPosts(slug);
    set({ posts });
  },
}));

export default usePostStore;
