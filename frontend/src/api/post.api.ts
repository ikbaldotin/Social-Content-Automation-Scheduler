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
export interface PublishAttempt {
  id: string;
  postId: string;
  attemptNo: number;
  success: boolean;
  error: string | null;
  attemptedAt: string;
  updatedAt: string;
}
export interface PostMedia {
  id: string;
  fileName: string;
  fileUrl: string;
  publicId: string;
  mimeType: string;
  size: number;
  postId: string;
  createdAt: string;
}
export interface PostDetails extends Post {
  medias: PostMedia[];
  publishAttempts: PublishAttempt[];
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
): Promise<PostDetails> => {
  const response = await api.get(`/post/${slug}/posts/${postId}`);
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
export const schedulePost = async (
  slug: string,
  postId: string,
  scheduledAt: string,
) => {
  const response = await api.patch(
    `/schedule/${slug}/posts/${postId}/schedule`,
    { scheduledAt },
  );

  return response.data;
};
export const reschedulePost = async (
  slug: string,
  postId: string,
  scheduledAt: string,
) => {
  const response = await api.patch(
    `/schedule/${slug}/posts/${postId}/reschedule`,
    { scheduledAt },
  );

  return response.data;
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
