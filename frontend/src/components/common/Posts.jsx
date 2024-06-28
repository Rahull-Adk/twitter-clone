import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { useEffect } from "react";
const Posts = ({ feedType }) => {
  const getPostEndPoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "api/posts/following";
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndPoint();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await axios.get(POST_ENDPOINT);
        const { data } = res;
        if (data.message) {
          console.log(data);
          return data;
        }
      } catch (error) {
        console.log(error.response.data.error);
        throw new Error(error);
      }
    },
  });
  useEffect(() => {
    refetch();
  }, [feedType, refetch]);
  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && data?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && data && (
        <div>
          {console.log("Data: ", data.posts)}
          {data?.posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
