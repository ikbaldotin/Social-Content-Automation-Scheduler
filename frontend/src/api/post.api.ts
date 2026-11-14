import api from "./axios";
export type PostStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "CANCELLED";

export interface Post {
  id: string;
  content: string;
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    name: string;
  };

  socialAccount: {
    id: string;
    platform: "INSTAGRAM" | "FACEBOOK" | "LINKEDIN";
    accountName: string;
  };
}

interface PostsResponse {
  message: string;
  posts: Post[];
}

interface PostResponse {
  message: string;
  post: Post;
}

export interface CreatePostInput {
  content: string;
  socialAccountId: string;
}

export interface UpdatePostInput {
  content?: string;
  socialAccountId?: string;
}

// Get all posts
export const getAllPosts = async (slug: string): Promise<Post[]> => {
  const response = await api.get<PostsResponse>(`/post/${slug}/posts`);

  return response.data.posts;
};
export const getPostById = async (
  slug: string,
  postId: string,
): Promise<Post> => {
  const response = await api.get<PostResponse>(`/post/${slug}/posts/${postId}`);
  return response.data.post;
};

export const createPost = async (
  slug: string,
  data: CreatePostInput,
): Promise<Post> => {
  const response = await api.post<PostResponse>(`/post/${slug}/posts`, data);
  return response.data.post;
};
export const updatePost = async (
  slug: string,
  postId: string,
  data: UpdatePostInput,
): Promise<Post> => {
  const response = await api.patch<PostResponse>(
    `/post/${slug}/posts/${postId}`,
    data,
  );
  return response.data.post;
};

export const deletePost = async (
  slug: string,
  postId: string,
): Promise<void> => {
  await api.delete(`/post/${slug}/posts/${postId}`);
};

export const cancelScheduledPost = async (
  slug: string,
  postId: string,
): Promise<Post> => {
  const response = await api.patch<PostResponse>(
    `/post/${slug}/posts/${postId}/cancel`,
  );
  return response.data.post;
};
