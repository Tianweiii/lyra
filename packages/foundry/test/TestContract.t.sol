// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/TestContract.sol";

contract TestContractTest is Test {
    TestContract public testContract;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        testContract = new TestContract(owner);
    }

    function testRegisterUser() public {
        vm.startPrank(user1);
        testContract.registerUser("alice");
        
        TestContract.User memory user = testContract.getUser(user1);
        assertEq(user.username, "alice");
        assertEq(user.userAddress, user1);
        assertEq(user.postCount, 0);
        assertEq(user.followerCount, 0);
        assertTrue(user.exists);
        vm.stopPrank();
    }

    function testCreatePost() public {
        // Register user first
        vm.startPrank(user1);
        testContract.registerUser("alice");
        
        // Create a post
        testContract.createPost("Hello World!");
        
        TestContract.Post memory post = testContract.getPost(1);
        assertEq(post.id, 1);
        assertEq(post.author, user1);
        assertEq(post.content, "Hello World!");
        assertEq(post.likes, 0);
        assertTrue(post.exists);
        
        // Check user post count increased
        TestContract.User memory user = testContract.getUser(user1);
        assertEq(user.postCount, 1);
        vm.stopPrank();
    }

    function testLikePost() public {
        // Setup: Register users and create a post
        vm.startPrank(user1);
        testContract.registerUser("alice");
        testContract.createPost("Hello World!");
        vm.stopPrank();
        
        vm.startPrank(user2);
        testContract.registerUser("bob");
        
        // Like the post
        testContract.likePost(1);
        
        // Check post likes increased
        TestContract.Post memory post = testContract.getPost(1);
        assertEq(post.likes, 1);
        
        // Check user has liked the post
        assertTrue(testContract.hasUserLikedPost(user2, 1));
        vm.stopPrank();
    }

    function testFollowUser() public {
        // Setup: Register users
        vm.startPrank(user1);
        testContract.registerUser("alice");
        vm.stopPrank();
        
        vm.startPrank(user2);
        testContract.registerUser("bob");
        
        // Follow user1
        testContract.followUser(user1);
        
        // Check follow relationship
        assertTrue(testContract.isUserFollowing(user2, user1));
        
        // Check follower count increased
        TestContract.User memory user = testContract.getUser(user1);
        assertEq(user.followerCount, 1);
        vm.stopPrank();
    }

    function testCannotLikeOwnPost() public {
        vm.startPrank(user1);
        testContract.registerUser("alice");
        testContract.createPost("Hello World!");
        
        // Should revert when trying to like own post
        vm.expectRevert("Cannot like your own post");
        testContract.likePost(1);
        vm.stopPrank();
    }

    function testCannotFollowSelf() public {
        vm.startPrank(user1);
        testContract.registerUser("alice");
        
        // Should revert when trying to follow self
        vm.expectRevert("Cannot follow yourself");
        testContract.followUser(user1);
        vm.stopPrank();
    }

    function testUnfollowUser() public {
        // Setup: Register users and follow
        vm.startPrank(user1);
        testContract.registerUser("alice");
        vm.stopPrank();
        
        vm.startPrank(user2);
        testContract.registerUser("bob");
        testContract.followUser(user1);
        
        // Unfollow user1
        testContract.unfollowUser(user1);
        
        // Check follow relationship removed
        assertFalse(testContract.isUserFollowing(user2, user1));
        
        // Check follower count decreased
        TestContract.User memory user = testContract.getUser(user1);
        assertEq(user.followerCount, 0);
        vm.stopPrank();
    }

    function testUnlikePost() public {
        // Setup: Register users, create post, and like it
        vm.startPrank(user1);
        testContract.registerUser("alice");
        testContract.createPost("Hello World!");
        vm.stopPrank();
        
        vm.startPrank(user2);
        testContract.registerUser("bob");
        testContract.likePost(1);
        
        // Unlike the post
        testContract.unlikePost(1);
        
        // Check post likes decreased
        TestContract.Post memory post = testContract.getPost(1);
        assertEq(post.likes, 0);
        
        // Check user has unliked the post
        assertFalse(testContract.hasUserLikedPost(user2, 1));
        vm.stopPrank();
    }
} 