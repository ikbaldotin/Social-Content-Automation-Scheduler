import { SocialPlatform } from "../generated/prisma";
import { PublishInput, PublishResult } from "../types/instagram.type";
import publishInstagramPost from "./instagram.provider";

const publishPost = async (data: PublishInput): Promise<PublishResult> => {
  switch (data.platform) {
    case SocialPlatform.INSTAGRAM:
      return publishInstagramPost({
        accountId: data.accountId,
        accessToken: data.accessToken,
        imageUrl: data.imageUrl,
        caption: data.content,
      });
    default:
      throw new Error(`Publishing is not implemented for ${data.platform}`);
  }
};

export default publishPost;
