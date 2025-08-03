"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function TestContractPage() {
  const { address } = useAccount();
  const [username, setUsername] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postId, setPostId] = useState("");
  const [userToFollow, setUserToFollow] = useState("");
  const [userToUnfollow, setUserToUnfollow] = useState("");

  const { writeContractAsync: writeTestContractAsync } = useScaffoldWriteContract({
    contractName: "TestContract",
  });

  const { data: userCounter } = useScaffoldReadContract({
    contractName: "TestContract",
    functionName: "userCounter",
  });

  const { data: postCounter } = useScaffoldReadContract({
    contractName: "TestContract",
    functionName: "postCounter",
  });

  const handleRegisterUser = async () => {
    if (!username.trim()) return;
    try {
      await writeTestContractAsync({
        functionName: "registerUser",
        args: [username],
      });
      setUsername("");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      await writeTestContractAsync({
        functionName: "createPost",
        args: [postContent],
      });
      setPostContent("");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLikePost = async () => {
    if (!postId.trim()) return;
    try {
      await writeTestContractAsync({
        functionName: "likePost",
        args: [BigInt(postId)],
      });
      setPostId("");
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleFollowUser = async () => {
    if (!userToFollow.trim()) return;
    try {
      await writeTestContractAsync({
        functionName: "followUser",
        args: [userToFollow as `0x${string}`],
      });
      setUserToFollow("");
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollowUser = async () => {
    if (!userToUnfollow.trim()) return;
    try {
      await writeTestContractAsync({
        functionName: "unfollowUser",
        args: [userToUnfollow as `0x${string}`],
      });
      setUserToUnfollow("");
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">TestContract Interface</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contract Stats */}
        <div className="bg-base-200 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Contract Stats</h2>
          <div className="space-y-2">
            <p>
              <strong>Total Users:</strong> {userCounter?.toString() || "0"}
            </p>
            <p>
              <strong>Total Posts:</strong> {postCounter?.toString() || "0"}
            </p>
            {address && (
              <p>
                <strong>Your Address:</strong> <Address address={address} />
              </p>
            )}
          </div>
        </div>

        {/* User Registration */}
        <div className="bg-base-200 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Register User</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="input input-bordered w-full"
            />
            <button onClick={handleRegisterUser} className="btn btn-primary w-full" disabled={!username.trim()}>
              Register User
            </button>
          </div>
        </div>

        {/* Create Post */}
        <div className="bg-base-200 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Create Post</h2>
          <div className="space-y-4">
            <textarea
              placeholder="Enter post content"
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              className="textarea textarea-bordered w-full h-24"
            />
            <button onClick={handleCreatePost} className="btn btn-primary w-full" disabled={!postContent.trim()}>
              Create Post
            </button>
          </div>
        </div>

        {/* Like Post */}
        <div className="bg-base-200 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Like Post</h2>
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Enter post ID"
              value={postId}
              onChange={e => setPostId(e.target.value)}
              className="input input-bordered w-full"
            />
            <button onClick={handleLikePost} className="btn btn-secondary w-full" disabled={!postId.trim()}>
              Like Post
            </button>
          </div>
        </div>

        {/* Follow User */}
        <div className="bg-base-200 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Follow User</h2>
          <div className="space-y-4">
            <AddressInput value={userToFollow} onChange={setUserToFollow} placeholder="Enter user address" />
            <button onClick={handleFollowUser} className="btn btn-accent w-full" disabled={!userToFollow.trim()}>
              Follow User
            </button>
          </div>
        </div>

        {/* Unfollow User */}
        <div className="bg-base-200 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Unfollow User</h2>
          <div className="space-y-4">
            <AddressInput value={userToUnfollow} onChange={setUserToUnfollow} placeholder="Enter user address" />
            <button onClick={handleUnfollowUser} className="btn btn-error w-full" disabled={!userToUnfollow.trim()}>
              Unfollow User
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Make sure you&apos;re connected to Scroll Sepolia network and have some test ETH
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Get test ETH from:{" "}
          <a
            href="https://sepolia.scrollscan.com/faucet"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary"
          >
            Scroll Sepolia Faucet
          </a>
        </p>
      </div>
    </div>
  );
}
