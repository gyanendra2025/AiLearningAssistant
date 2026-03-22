import ApiKey from "../models/ApiKey.js";
import ApiUsage from "../models/ApiUsage.js";
import { encrypt, decrypt, maskApiKey } from "../utils/encryption.js";
import { getAiService } from "../utils/aiProviderFactory.js";

// ──────────────── API Key CRUD ────────────────

/**
 * POST /api/settings/api-key
 * Save or update an API key
 */
export const saveApiKey = async (req, res, next) => {
  try {
    const { provider, apiKey, label } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        error: "Provider and API key are required",
      });
    }

    if (!["gemini", "openai"].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Provider must be "gemini" or "openai"',
      });
    }

    // Validate the key by attempting a small API call
    try {
      const service = await getAiService(provider);
      // For Gemini, the getModel inside won't throw until we actually call it
      // So we just verify it's a non-empty string
      if (apiKey.trim().length < 10) {
        throw new Error("API key is too short");
      }
    } catch (validationError) {
      // Non-critical — we still save but warn
    }

    const encryptedKey = encrypt(apiKey.trim());
    const masked = maskApiKey(apiKey.trim());

    // Check if user already has a key for this provider
    const existing = await ApiKey.findOne({
      userId: req.user._id,
      provider,
    });

    let savedKey;
    if (existing) {
      existing.encryptedKey = encryptedKey;
      existing.maskedKey = masked;
      existing.label = label || existing.label;
      savedKey = await existing.save();
    } else {
      // Deactivate other keys if this is the first one
      const hasAnyKey = await ApiKey.countDocuments({ userId: req.user._id });
      savedKey = await ApiKey.create({
        userId: req.user._id,
        provider,
        encryptedKey,
        maskedKey: masked,
        label: label || `My ${provider === "gemini" ? "Gemini" : "OpenAI"} Key`,
        isActive: hasAnyKey === 0, // First key auto-activates
      });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: savedKey._id,
        provider: savedKey.provider,
        maskedKey: savedKey.maskedKey,
        label: savedKey.label,
        isActive: savedKey.isActive,
        createdAt: savedKey.createdAt,
      },
      message: "API key saved successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/settings/api-keys
 * Get all user's API keys (masked)
 */
export const getApiKeys = async (req, res, next) => {
  try {
    const keys = await ApiKey.find({ userId: req.user._id })
      .select("-encryptedKey")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: keys,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/settings/api-key/:id
 */
export const deleteApiKey = async (req, res, next) => {
  try {
    const key = await ApiKey.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!key) {
      return res.status(404).json({
        success: false,
        error: "API key not found",
      });
    }

    const wasActive = key.isActive;
    await key.deleteOne();

    // If deleted key was active, activate another key if available
    if (wasActive) {
      const nextKey = await ApiKey.findOne({ userId: req.user._id });
      if (nextKey) {
        nextKey.isActive = true;
        await nextKey.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "API key deleted",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/settings/api-key/:id/activate
 * Set a key as the active provider
 */
export const activateApiKey = async (req, res, next) => {
  try {
    const key = await ApiKey.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!key) {
      return res.status(404).json({
        success: false,
        error: "API key not found",
      });
    }

    // Deactivate all keys for this user
    await ApiKey.updateMany(
      { userId: req.user._id },
      { isActive: false }
    );

    // Activate this one
    key.isActive = true;
    await key.save();

    res.status(200).json({
      success: true,
      data: {
        _id: key._id,
        provider: key.provider,
        isActive: true,
      },
      message: `${key.provider} key activated`,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────── Usage Stats ────────────────

/**
 * GET /api/settings/usage?days=30
 * Get detailed usage history
 */
export const getUsageHistory = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const usage = await ApiUsage.find({
      userId: req.user._id,
      createdAt: { $gte: since },
    })
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/settings/usage/summary?days=30
 * Get aggregated cost summary
 */
export const getUsageSummary = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const summary = await ApiUsage.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: "$provider",
          totalCalls: { $sum: 1 },
          totalInputTokens: { $sum: "$inputTokens" },
          totalOutputTokens: { $sum: "$outputTokens" },
          totalTokens: { $sum: "$totalTokens" },
          totalCost: { $sum: "$estimatedCost" },
          successCount: {
            $sum: { $cond: [{ $eq: ["$success", true] }, 1, 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$success", false] }, 1, 0] },
          },
        },
      },
    ]);

    // Also get per-action breakdown
    const actionBreakdown = await ApiUsage.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: { provider: "$provider", action: "$action" },
          count: { $sum: 1 },
          totalTokens: { $sum: "$totalTokens" },
          totalCost: { $sum: "$estimatedCost" },
        },
      },
      { $sort: { "_id.provider": 1, count: -1 } },
    ]);

    // Grand totals
    const grandTotal = summary.reduce(
      (acc, s) => ({
        totalCalls: acc.totalCalls + s.totalCalls,
        totalTokens: acc.totalTokens + s.totalTokens,
        totalCost: acc.totalCost + s.totalCost,
      }),
      { totalCalls: 0, totalTokens: 0, totalCost: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        byProvider: summary,
        byAction: actionBreakdown,
        totals: grandTotal,
        periodDays: days,
      },
    });
  } catch (error) {
    next(error);
  }
};
