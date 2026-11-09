interface PublishPostInput {
  postId: string;
  content: string;
  platform: string;
  accountName: string;
}
interface PublishPostResult {
  success: boolean;
  externalPostId: string;
  message: string;
}
const publishPost = async (
  data: PublishPostInput,
): Promise<PublishPostResult> => {
  console.log("Mock provider: Publishing post...");
  console.log("Platform:", data.platform);
  console.log("Account:", data.accountName);
  console.log("Content:", data.content);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    success: true,
    externalPostId: `mock-${data.postId}`,
    message: "Post published successfully by mock provider",
  };
};
export default publishPost;
