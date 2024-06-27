import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton.jsx";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";

const RightPanel = () => {
  const { data: getSuggestedUser, isLoading } = useQuery({
    queryKey: ["suggestedUser"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/users/suggested");
        const { data } = res;
        if (data.message) {
          console.log(data.message);
        }
        return data;
      } catch (error) {
        console.log(error.response.data.error);
        throw new Error(error.message);
      }
    },
  });
  if (getSuggestedUser?.length === 0)
    return <div className="md:w-64 w-0"></div>;
  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold">Who to follow</p>
        <div className="flex flex-col gap-4">
          {/* item */}
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoading &&
            getSuggestedUser?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={
                          user.profileImg ||
                          "../../../avatar-placeholder (1).png"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-28">
                      {user.fullName}
                    </span>
                    <span className="text-sm text-slate-500">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => e.preventDefault()}
                  >
                    Follow
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
