import api from "./axios";
import type { PostMedia } from "./post.api";

interface UploadMediaResponse {
  message: string;
  media: PostMedia;
}

interface GetMediaResponse {
  message: string;
  medias: PostMedia[];
}

export const uploadPostMedia = async (
  slug: string,
  postId: string,
  file: File,
): Promise<PostMedia> => {
  const formData = new FormData();
  formData.append("media", file);

  const response = await api.post<UploadMediaResponse>(
    `/media/${slug}/posts/${postId}/media`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.media;
};

export const getPostMedia = async (
  slug: string,
  postId: string,
): Promise<PostMedia[]> => {
  const response = await api.get<GetMediaResponse>(
    `/media/${slug}/posts/${postId}/media`,
  );

  return response.data.medias;
};

export const deletePostMedia = async (
  slug: string,
  postId: string,
  mediaId: string,
): Promise<void> => {
  await api.delete(`/media/${slug}/posts/${postId}/media/${mediaId}`);
};
