import {
  ContainerResponse,
  ContainerStatus,
  InstagramPublishInput,
  InstagramPublishResult,
  PublishResponse,
} from "../types/instagram.type";
import { instagramPost, instagramRequest } from "./instagram.client";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const publishInstagramPost = async (
  data: InstagramPublishInput,
): Promise<InstagramPublishResult> => {
  const { accountId, accessToken, imageUrl, caption } = data;
  const parseUrl = new URL(imageUrl);
  if (parseUrl.protocol !== "https:") {
    throw new Error("Instagram image URL must use HTTPS");
  }
  const container = await instagramPost<ContainerResponse>(
    `${accountId}/media`,
    accessToken,
    {
      image_url: imageUrl,
      caption,
    },
  );
  if (!container.id) {
    throw new Error("Instagram did not return a media container ID");
  }
  console.log("Instagram container created:", container.id);
  let containerReady = false;
  for (let attempt = 1; attempt <= 30; attempt++) {
    const status = await instagramRequest<ContainerStatus>(
      container.id,
      accessToken,
      {
        fields: "status_code,status",
      },
    );
    if (status.status_code === "FINISHED") {
      containerReady = true;
      break;
    }
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
      throw new Error(
        status.status ?? `Instagram container ${status.status_code}`,
      );
    }
    if (status.status_code === "PUBLISHED") {
      throw new Error("Instagram container was already published");
    }
    await wait(2000);
  }
  if (!containerReady) {
    throw new Error("Instagram image processing timed out");
  }
  const published = await instagramPost<PublishResponse>(
    `${accountId}/media_publish`,
    accessToken,
    {
      creation_id: container.id,
    },
  );
  if (!published.id) {
    throw new Error("Instagram did not return a published media ID");
  }
  return {
    success: true,
    externalPostId: published.id,
    message: "Instagram post published successfully",
  };
};

export default publishInstagramPost;
