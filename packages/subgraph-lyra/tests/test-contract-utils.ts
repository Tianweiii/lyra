import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  PostCreated,
  PostLiked,
  PostUnliked,
  UserFollowed,
  UserRegistered,
  UserUnfollowed
} from "../generated/TestContract/TestContract"

export function createPostCreatedEvent(
  postId: BigInt,
  author: Address,
  content: string,
  timestamp: BigInt
): PostCreated {
  let postCreatedEvent = changetype<PostCreated>(newMockEvent())

  postCreatedEvent.parameters = new Array()

  postCreatedEvent.parameters.push(
    new ethereum.EventParam("postId", ethereum.Value.fromUnsignedBigInt(postId))
  )
  postCreatedEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  postCreatedEvent.parameters.push(
    new ethereum.EventParam("content", ethereum.Value.fromString(content))
  )
  postCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return postCreatedEvent
}

export function createPostLikedEvent(
  postId: BigInt,
  liker: Address,
  author: Address,
  timestamp: BigInt
): PostLiked {
  let postLikedEvent = changetype<PostLiked>(newMockEvent())

  postLikedEvent.parameters = new Array()

  postLikedEvent.parameters.push(
    new ethereum.EventParam("postId", ethereum.Value.fromUnsignedBigInt(postId))
  )
  postLikedEvent.parameters.push(
    new ethereum.EventParam("liker", ethereum.Value.fromAddress(liker))
  )
  postLikedEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  postLikedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return postLikedEvent
}

export function createPostUnlikedEvent(
  postId: BigInt,
  unliker: Address,
  author: Address,
  timestamp: BigInt
): PostUnliked {
  let postUnlikedEvent = changetype<PostUnliked>(newMockEvent())

  postUnlikedEvent.parameters = new Array()

  postUnlikedEvent.parameters.push(
    new ethereum.EventParam("postId", ethereum.Value.fromUnsignedBigInt(postId))
  )
  postUnlikedEvent.parameters.push(
    new ethereum.EventParam("unliker", ethereum.Value.fromAddress(unliker))
  )
  postUnlikedEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  postUnlikedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return postUnlikedEvent
}

export function createUserFollowedEvent(
  follower: Address,
  following: Address,
  timestamp: BigInt
): UserFollowed {
  let userFollowedEvent = changetype<UserFollowed>(newMockEvent())

  userFollowedEvent.parameters = new Array()

  userFollowedEvent.parameters.push(
    new ethereum.EventParam("follower", ethereum.Value.fromAddress(follower))
  )
  userFollowedEvent.parameters.push(
    new ethereum.EventParam("following", ethereum.Value.fromAddress(following))
  )
  userFollowedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return userFollowedEvent
}

export function createUserRegisteredEvent(
  userAddress: Address,
  username: string,
  timestamp: BigInt
): UserRegistered {
  let userRegisteredEvent = changetype<UserRegistered>(newMockEvent())

  userRegisteredEvent.parameters = new Array()

  userRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "userAddress",
      ethereum.Value.fromAddress(userAddress)
    )
  )
  userRegisteredEvent.parameters.push(
    new ethereum.EventParam("username", ethereum.Value.fromString(username))
  )
  userRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return userRegisteredEvent
}

export function createUserUnfollowedEvent(
  follower: Address,
  following: Address,
  timestamp: BigInt
): UserUnfollowed {
  let userUnfollowedEvent = changetype<UserUnfollowed>(newMockEvent())

  userUnfollowedEvent.parameters = new Array()

  userUnfollowedEvent.parameters.push(
    new ethereum.EventParam("follower", ethereum.Value.fromAddress(follower))
  )
  userUnfollowedEvent.parameters.push(
    new ethereum.EventParam("following", ethereum.Value.fromAddress(following))
  )
  userUnfollowedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return userUnfollowedEvent
}
