import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { Like } from '../models/Engagement';
import { User } from '../models/User';
import { isDbConnected } from '../config/database';
import { asyncHandler, sendSuccess, sendPaginated } from '../utils/helpers';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const MOCK_COMMUNITY_POSTS = [
  {
    _id: 'mock_post_1',
    userId: {
      _id: 'user_mock_1',
      displayName: 'Lê Minh Tuấn',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      level: 3,
    },
    placeId: {
      _id: '65e000000000000000000001',
      name: 'Vịnh Hạ Long',
      province: 'Quảng Ninh',
      coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop',
    },
    type: 'photo',
    content: 'Chuyến đi Vịnh Hạ Long tuyệt vời trên du thuyền 5 sao cùng gia đình! Cảnh sắc Việt Nam mình đẹp ngỡ ngàng.',
    media: ['https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop',
    likesCount: 142,
    commentsCount: 18,
    isLiked: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock_post_2',
    userId: {
      _id: 'user_mock_2',
      displayName: 'Nguyễn Thảo Nhi',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      level: 5,
    },
    placeId: {
      _id: '65e000000000000000000002',
      name: 'Phố Cổ Hội An',
      province: 'Quảng Nam',
      coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop',
    },
    type: 'photo',
    content: 'Đêm phố cổ Hội An lung linh đèn lồng. Đồ ăn vặt ở đây siêu ngon và người dân cực kỳ thân thiện! ❤️',
    media: ['https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop',
    likesCount: 285,
    commentsCount: 34,
    isLiked: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// --- Posts ---
export const getFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '15', type } = req.query as Record<string, string>;
  const p = parseInt(page);
  const l = Math.min(parseInt(limit), 30);

  if (!isDbConnected) {
    sendPaginated(res, MOCK_COMMUNITY_POSTS, MOCK_COMMUNITY_POSTS.length, p, l);
    return;
  }

  const filter: Record<string, unknown> = { isActive: true, isPublic: true };
  if (type) filter.type = type;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('userId', 'displayName avatar level')
      .populate('placeId', 'name province coverImage')
      .sort('-createdAt')
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Post.countDocuments(filter),
  ]);

  // If authenticated, check which posts user has liked
  let likedPostIds: Set<string> = new Set();
  if (req.user) {
    const likes = await Like.find({
      userId: req.user._id,
      targetType: 'post',
      targetId: { $in: posts.map((p) => p._id) },
    }).select('targetId');
    likedPostIds = new Set(likes.map((l) => l.targetId.toString()));
  }

  const enrichedPosts = posts.map((post) => ({
    ...post,
    isLiked: likedPostIds.has(post._id.toString()),
  }));

  sendPaginated(res, enrichedPosts, total, p, l);
});

export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const media = (req.files as Express.Multer.File[])?.map(
    (f) => (f as Express.Multer.File & { path: string }).path,
  ) || [];

  const post = await Post.create({
    userId: req.user!._id,
    type: req.body.type || 'photo',
    content: req.body.content,
    media,
    thumbnail: media[0] || undefined,
    placeId: req.body.placeId || undefined,
    tags: req.body.tags ? JSON.parse(req.body.tags) : [],
    isPublic: req.body.isPublic !== 'false',
    expiresAt: req.body.type === 'story' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
  });

  await User.findByIdAndUpdate(req.user!._id, { $inc: { postsCount: 1 } });

  const populated = await Post.findById(post._id)
    .populate('userId', 'displayName avatar')
    .populate('placeId', 'name province');

  sendSuccess(res, { post: populated }, 'Post created', 201);
});

export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new NotFoundError('Post not found');
  if (post.userId.toString() !== req.user!._id && req.user!.role !== 'admin') {
    throw new ForbiddenError();
  }
  await post.deleteOne();
  await User.findByIdAndUpdate(req.user!._id, { $inc: { postsCount: -1 } });
  sendSuccess(res, null, 'Post deleted');
});

export const toggleLikePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new NotFoundError('Post not found');

  const existingLike = await Like.findOne({
    userId: req.user!._id,
    targetType: 'post',
    targetId: req.params.id,
  });

  let isLiked: boolean;
  if (existingLike) {
    await existingLike.deleteOne();
    await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: -1 } });
    isLiked = false;
  } else {
    await Like.create({ userId: req.user!._id, targetType: 'post', targetId: req.params.id });
    await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: 1 } });
    isLiked = true;
  }

  sendSuccess(res, { isLiked }, isLiked ? 'Post liked' : 'Post unliked');
});

// --- Comments ---
export const getComments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const p = parseInt(page);
  const l = parseInt(limit);

  const [comments, total] = await Promise.all([
    Comment.find({ postId: req.params.postId, isActive: true, parentCommentId: null })
      .populate('userId', 'displayName avatar')
      .sort('createdAt')
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Comment.countDocuments({ postId: req.params.postId, isActive: true, parentCommentId: null }),
  ]);

  sendPaginated(res, comments, total, p, l);
});

export const createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comment = await Comment.create({
    postId: req.params.postId,
    userId: req.user!._id,
    content: req.body.content,
    parentCommentId: req.body.parentCommentId || null,
  });

  await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentsCount: 1 } });

  const populated = await Comment.findById(comment._id)
    .populate('userId', 'displayName avatar');

  sendSuccess(res, { comment: populated }, 'Comment added', 201);
});
