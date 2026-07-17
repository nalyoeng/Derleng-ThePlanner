import {
  getActiveRestrictions,
} from '../services/restrictionService.js';

const getUserId = (req) => {
  return req.profile?.id || req.user?.id;
};
export const loadRestrictions = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required.',
      });
    }

    req.restrictions =
      await getActiveRestrictions(userId);

    next();
  } catch (error) {
    console.error(
      'Load restrictions error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Could not check account restrictions.',
    });
  }
};

export const blockFullBan = (
  req,
  res,
  next
) => {
  const fullBan = req.restrictions?.find(
    (restriction) =>
      restriction.type === 'full_ban'
  );

  if (fullBan) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_FULL_BANNED',
      message:
        fullBan.reason ||
        'Your account has been banned.',
      restriction: fullBan,
    });
  }

  next();
};

export const blockCommentBan = (
  req,
  res,
  next
) => {
  const commentBan = req.restrictions?.find(
    (restriction) =>
      restriction.type === 'comment_ban'
  );

  if (commentBan) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_COMMENT_BANNED',
      message:
        commentBan.reason ||
        'You are not allowed to post comments or reviews.',
      restriction: commentBan,
    });
  }

  next();
};

export const blockRestrictedWrite = (
  req,
  res,
  next
) => {
  const restriction = req.restrictions?.find(
    (item) => item.type === 'restricted'
  );

  if (restriction) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_RESTRICTED',
      message:
        restriction.reason ||
        'Your account is temporarily restricted.',
      restriction,
    });
  }

  next();
};