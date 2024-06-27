import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const useFollow = () => {
  const queryClient = useQueryClient();
  const { mutate: follow, isLoading: isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        console.log(`Sending follow request for user ID: ${userId}`);
        const response = await axios.post(`/api/users/follow/${userId}`);
        const { data } = response;
        console.log("Follow response data:", data);
        if (data.message) {
          toast.success(data.message);
          return data;
        }
      } catch (error) {
        console.error("Follow request error:", error);
        toast.error(error.response.data.error || "An error occurred");
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
    },
  });
  return { follow, isPending };
};

export default useFollow;
