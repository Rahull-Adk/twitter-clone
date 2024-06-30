import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
  const getPostEndPoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      case "posts":
        return `/api/posts/user/${username.username}`;
      case "likes":
        return `/api/posts/likes/${userId}`;
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndPoint();

  const { data, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const { data } = await axios.get(POST_ENDPOINT);
        console.log("API Response:", data);
        return data;
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw new Error(error);
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);

  if (error) {
    return (
      <p className="text-center my-4">
        Error loading posts. Please try again later.
      </p>
    );
  }

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {!isLoading &&
        !isRefetching &&
        Array.isArray(data) &&
        data.length === 0 && (
          <p className="text-center my-4">No posts in this tab. Switch 👻</p>
        )}

      {!isLoading && !isRefetching && Array.isArray(data) && (
        <div>
          {data?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};

export default Posts;
