//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";

/**
 * A test smart contract with multiple events for subgraph indexing
 * This contract allows users to create posts, like posts, and follow other users
 * @author Test Developer
 */
contract TestContract {
    // State Variables
    address public immutable owner;
    uint256 public postCounter = 0;
    uint256 public userCounter = 0;
    
    // Structs
    struct Post {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
        bool exists;
    }
    
    struct User {
        address userAddress;
        string username;
        uint256 postCount;
        uint256 followerCount;
        bool exists;
    }
    
    // Mappings
    mapping(uint256 => Post) public posts;
    mapping(address => User) public users;
    mapping(address => mapping(uint256 => bool)) public userLikes; // user => postId => hasLiked
    mapping(address => mapping(address => bool)) public userFollows; // follower => following => isFollowing
    
    // Events for subgraph indexing
    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string content,
        uint256 timestamp
    );
    
    event PostLiked(
        uint256 indexed postId,
        address indexed liker,
        address indexed author,
        uint256 timestamp
    );
    
    event PostUnliked(
        uint256 indexed postId,
        address indexed unliker,
        address indexed author,
        uint256 timestamp
    );
    
    event UserRegistered(
        address indexed userAddress,
        string username,
        uint256 timestamp
    );
    
    event UserFollowed(
        address indexed follower,
        address indexed following,
        uint256 timestamp
    );
    
    event UserUnfollowed(
        address indexed follower,
        address indexed following,
        uint256 timestamp
    );
    
    // Constructor
    constructor(address _owner) {
        owner = _owner;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }
    
    modifier userExists() {
        require(users[msg.sender].exists, "User not registered");
        _;
    }
    
    modifier postExists(uint256 _postId) {
        require(posts[_postId].exists, "Post does not exist");
        _;
    }
    
    /**
     * Register a new user
     * @param _username The username for the user
     */
    function registerUser(string memory _username) public {
        require(!users[msg.sender].exists, "User already registered");
        require(bytes(_username).length > 0, "Username cannot be empty");
        
        userCounter++;
        users[msg.sender] = User({
            userAddress: msg.sender,
            username: _username,
            postCount: 0,
            followerCount: 0,
            exists: true
        });
        
        emit UserRegistered(msg.sender, _username, block.timestamp);
    }
    
    /**
     * Create a new post
     * @param _content The content of the post
     */
    function createPost(string memory _content) public userExists {
        require(bytes(_content).length > 0, "Post content cannot be empty");
        
        postCounter++;
        posts[postCounter] = Post({
            id: postCounter,
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            likes: 0,
            exists: true
        });
        
        users[msg.sender].postCount++;
        
        emit PostCreated(postCounter, msg.sender, _content, block.timestamp);
    }
    
    /**
     * Like a post
     * @param _postId The ID of the post to like
     */
    function likePost(uint256 _postId) public userExists postExists(_postId) {
        require(!userLikes[msg.sender][_postId], "Already liked this post");
        require(posts[_postId].author != msg.sender, "Cannot like your own post");
        
        posts[_postId].likes++;
        userLikes[msg.sender][_postId] = true;
        
        emit PostLiked(_postId, msg.sender, posts[_postId].author, block.timestamp);
    }
    
    /**
     * Unlike a post
     * @param _postId The ID of the post to unlike
     */
    function unlikePost(uint256 _postId) public userExists postExists(_postId) {
        require(userLikes[msg.sender][_postId], "Have not liked this post");
        
        posts[_postId].likes--;
        userLikes[msg.sender][_postId] = false;
        
        emit PostUnliked(_postId, msg.sender, posts[_postId].author, block.timestamp);
    }
    
    /**
     * Follow another user
     * @param _userToFollow The address of the user to follow
     */
    function followUser(address _userToFollow) public userExists {
        require(_userToFollow != msg.sender, "Cannot follow yourself");
        require(users[_userToFollow].exists, "User to follow does not exist");
        require(!userFollows[msg.sender][_userToFollow], "Already following this user");
        
        userFollows[msg.sender][_userToFollow] = true;
        users[_userToFollow].followerCount++;
        
        emit UserFollowed(msg.sender, _userToFollow, block.timestamp);
    }
    
    /**
     * Unfollow another user
     * @param _userToUnfollow The address of the user to unfollow
     */
    function unfollowUser(address _userToUnfollow) public userExists {
        require(userFollows[msg.sender][_userToUnfollow], "Not following this user");
        
        userFollows[msg.sender][_userToUnfollow] = false;
        users[_userToUnfollow].followerCount--;
        
        emit UserUnfollowed(msg.sender, _userToUnfollow, block.timestamp);
    }
    
    /**
     * Get post details
     * @param _postId The ID of the post
     */
    function getPost(uint256 _postId) public view returns (Post memory) {
        return posts[_postId];
    }
    
    /**
     * Get user details
     * @param _userAddress The address of the user
     */
    function getUser(address _userAddress) public view returns (User memory) {
        return users[_userAddress];
    }
    
    /**
     * Check if a user has liked a post
     * @param _user The user address
     * @param _postId The post ID
     */
    function hasUserLikedPost(address _user, uint256 _postId) public view returns (bool) {
        return userLikes[_user][_postId];
    }
    
    /**
     * Check if a user is following another user
     * @param _follower The follower address
     * @param _following The following address
     */
    function isUserFollowing(address _follower, address _following) public view returns (bool) {
        return userFollows[_follower][_following];
    }
} 