import { Mongoose, Schema } from "mongoose";

const TweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 280, // Twitter's character limit
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

export const Tweet = Mongoose.model('Tweet', TweetSchema);